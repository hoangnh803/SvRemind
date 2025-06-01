#----------------------------------------------------------------------------
# Mục đích: copy các nguồn lực cần thiết lên máy chủ từ xa
# Tiền xử lý:
# - Sửa file pm2.config.js nếu cần
# - Cài đặt python. Hãy thử kiểm tra lại bằng cách chạy các tiến trình trong thư mục outbound
# - Phai cai goi Install-Module -Name SSHSessions
# - Cài đặt install-module posh-ssh  trên powershell 5 (đừng cài trên powershel 7, sẽ bị lệch version các gói)
# Thực thi
# - Chạy script này
# Hậu xử lý

# - Xem uptime có đúng là khởi động lại không?
#----------------------------------------------------------------------------
# Định nghĩa các thư mục và file cần copy
$sourcePaths = 'dist/*  package.json   pm2.config.js .env'

$username = "hoangnh"
$remoteHost = "api.lienlac.sinhvien.online"
$remotePath = "/home/hoangnh/api.lienlac.sinhvien.online"

# Nhập mật khẩu một cách an toàn
$password = Read-Host -Prompt "Mật khẩu tài khoản ${username}:" -AsSecureString

# Tạo kết nối SSH
$credential = New-Object System.Management.Automation.PSCredential ($username, $password)
$session = New-SSHSession -ComputerName $remoteHost -Credential $credential

#Biên dịch chương trình
#npm run build

## Sử dụng SCP để copy thư mục  (Set-SCPItem  không có tác dụng)
## Fix-bug: Chạy scp -r thì phải đặt trong Invoke-Epression thì mới được, chứ không được chạy trực tiếp.
Invoke-Expression "scp -o  StrictHostKeyChecking=no -r  $sourcePaths  $username@${remoteHost}:$remotePath"
#$result = Set-SCPItem -Path $sourcePath -Destination $remotePath -Credential $credential -ComputerName $remoteHost -Force
#$result.Output

# Thực hiện lệnh từ xa
Write-Output "Execute npm install"
$command = "cd $remotePath && npm install --omit=dev --legacy-peer-deps"
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command $command
$result.Output

Write-Output "Restart pm2"
$command = "cd $remotePath && pm2 reload pm2.config.js"
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command $command
$result.Output

$command = "cd $remotePath && pm2 ls"
$result = Invoke-SSHCommand -SessionId $session.SessionId -Command $command
$result.Output

# Đóng kết nối SSH
Remove-SSHSession -SessionId $session.SessionId