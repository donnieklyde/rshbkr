
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const password = request.cookies.get('admin_session')?.value;
        if (password !== process.env.ADMIN_PASSWORD) {
          throw new Error('Unauthorized');
        }

        return {
          allowedContentTypes: ['application/x-msdos-program', 'application/octet-stream'],
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('software upload completed', blob, tokenPayload);
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
