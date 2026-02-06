package com.rshbkr.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import com.rshbkr.app.api.NetworkClient

@Composable
fun SetUsernameDialog(
    currentUsername: String,
    onDismiss: () -> Unit,
    onUsernameSet: (String) -> Unit
) {
    var username by remember { mutableStateOf(currentUsername) }
    var isLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Set Username") },
        text = {
            Column {
                Text("Choose a unique username.")
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("Username") },
                    singleLine = true,
                    isError = error != null
                )
                if (error != null) {
                    Text(error!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    scope.launch {
                        isLoading = true
                        error = null
                        // We need to change updateUsername to return a Result or error string to show specific msg
                        // For now, let's assume it returns a custom object or we change signature?
                        // Or we can just hack it in NetworkClient to return String? error.
                        // Let's keep it Boolean for now but NetworkClient logs it. 
                        // Actually, if we want "Username Taken", we need the status code.
                        // Let's modify logic briefly to just try:
                        val success = NetworkClient.updateUsername(username)
                        if (success) {
                            onUsernameSet(username)
                            onDismiss() // Close dialog
                        } else {
                            // If failed, likely taken or network
                             error = "Username unavailable or error."
                        }
                        isLoading = false
                    }
                },
                enabled = !isLoading && username.isNotBlank()
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                } else {
                    Text("Save")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
