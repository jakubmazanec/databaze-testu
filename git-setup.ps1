$username = Read-Host 'Set username to'
$email = Read-Host 'Set email to'
$isUsernameValid = $username -ne ''
$isEmailValid = [bool]($email -as [Net.Mail.MailAddress])

Write-Host 'Configuring git repo!'

if ($isUsernameValid -eq 1) {
	Write-Host ('Setting username to "' + $username + '"...')
	git config user.name $username
} else {
	Write-Host 'Invalid username! Skipping...'
}

if ($isEmailValid -eq 1) {
	Write-Host ('Setting email to "' + $email + '"...')
	git config user.email $email
} else {
	Write-Host 'Invalid email! Skipping...'
}

Write-Host 'Adding link to local git config...'
git config include.path "../.gitconfig"

Write-Host 'Done.'
