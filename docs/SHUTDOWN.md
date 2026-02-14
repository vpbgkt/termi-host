# Server Shutdown Feature

## Overview
termi-host includes a web-based server shutdown feature for emergency situations or when you need to quickly stop all access to your server.

## Access
The shutdown button is **only visible to authenticated users** in the terminal interface.

## How to Use

1. **Login** to the terminal interface
2. Look for the **🛑 Shutdown Server** button in the top-right header
3. Click the button
4. You will see **two confirmation dialogs**:
   - First confirmation: Warns that all sessions will be terminated
   - Second confirmation: Final warning that the action cannot be undone
5. After confirming both dialogs, the server will shutdown gracefully within 1 second

## Security Features

### Authentication Required
- The shutdown endpoint requires active authentication
- Unauthenticated users cannot access this feature
- Session must be valid (not expired)

### Double Confirmation
- Two separate confirmation dialogs prevent accidental shutdowns
- Clear warnings about the consequences

### Logging
- All shutdown requests are logged with the username
- Check server logs: `journalctl -u termi-host -n 100`

## Restarting After Shutdown

If you're using **systemd** (recommended for production):
```bash
sudo systemctl start termi-host
# or
sudo systemctl restart termi-host
```

If running manually:
```bash
cd /path/to/termi-host
npm start
```

## Use Cases

### Emergency Shutdown
- Security breach detected
- Unauthorized access attempt
- Need to immediately stop all connections

### Maintenance
- Before performing system updates
- Before making configuration changes
- Before backup operations

### Resource Management
- Free up server resources quickly
- Stop the service when not needed
- Prevent unnecessary resource consumption

## Alternative Shutdown Methods

You can also shutdown the server using:

### 1. SSH Command
```bash
sudo systemctl stop termi-host
```

### 2. Direct Process Kill
```bash
# Find the process
ps aux | grep node

# Kill it (replace PID with actual process ID)
kill <PID>
```

### 3. Control Panel (if applicable)
Use your hosting provider's control panel to stop the service.

## Important Notes

⚠️ **WARNING**: Shutting down the server will:
- Terminate ALL active terminal sessions immediately
- Disconnect all connected users
- Stop the web interface
- Require manual restart (systemd will NOT auto-restart for graceful exits)

✅ **Best Practice**: 
- Notify users before shutting down
- Use this feature only when necessary
- Have a plan to restart the service
- Consider using `systemctl restart` instead if you just need to reload configuration

## Configuration

To disable this feature entirely, you can:

1. Remove the shutdown button from `public/terminal.html`
2. Comment out the shutdown endpoint in `src/auth.js`
3. Or add a configuration option in `config/default.json`:

```json
{
  "security": {
    "allowWebShutdown": false
  }
}
```

## Troubleshooting

**Button not visible?**
- Ensure you're logged in
- Check browser console for JavaScript errors
- Clear browser cache and refresh

**Shutdown doesn't work?**
- Check server logs: `journalctl -u termi-host -f`
- Verify authentication is working
- Ensure proper permissions for process termination

**Server won't restart?**
- Check systemd status: `systemctl status termi-host`
- View error logs: `journalctl -u termi-host -n 50`
- Verify configuration files are valid

## For Developers

The shutdown feature consists of:

1. **Backend**: `/api/auth/shutdown` POST endpoint in `src/auth.js`
2. **Frontend**: Shutdown button in `public/terminal.html`
3. **Logic**: Double-confirmation in `public/app.js`

The server waits 1 second after sending the response before calling `process.exit(0)` to ensure the client receives confirmation.
