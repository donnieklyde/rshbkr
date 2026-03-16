
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Authenticate user here (already handled by middleware, but good to double check)
        const password = request.headers.get('cookie')?.split(';').find(c => c.trim().startsWith('admin_session='))?.split('=')[1];
        if (password !== process.env.ADMIN_PASSWORD) {
          throw new Error('Unauthorized');
        }

        return {
          allowedContentTypes: ['audio/mpeg'],
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('blob upload completed', blob, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
