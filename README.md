# Password Converter
Create secure, deterministic passwords locally in your browser.

## Why
Remembering long and strong passwords for the many accounts you have is hard. A common solution is a password manager, but that itself is an account that needs a strong password.

This project generates deterministic, strong passwords from shorter, memorable inputs. You can remember a simpler password and, when you need the strong password for an account, generate it locally in your browser.

## How to use
To generate a strong password, provide:
- a password (at least 8 characters),
- a salt (a second secret, also at least 8 characters), and
- the desired length of the generated password.
- choose an alphabet for generated password (allowed characters)

## Security
Notes and recommendations:
- Your generated password should be at least 12 characters long.
- Use a unique salt per account (site-specific salt) to ensure different derived passwords for different accounts.
- Make sure the generated password meets the target site's password policy (allowed characters, required symbols, maximum length, etc.). See the Technical Details below for the allowed characters used by this generator.
- Using a longer alphabet makes your password stronger.
- This approach significantly improves protection against generalized attacks compared to using simpler, memorable passwords.
- If an attacker specifically targets you and knows you use this scheme, security depends heavily on the strength of your initial password and the secrecy of your salt. A weak initial password can make the derived password vulnerable.
- Generating passwords locally in the browser avoids storing or transferring them remotely, but it does not protect you if your device is compromised.
- If the site or program you use transmits or stores passwords insecurely (no TLS, poor server-side storage), you may need a longer or stronger derived password to compensate.

## Recommendations
- If you use a master password with different salts for your accounts, make sure your master password is reasonably strong.
- Use browser-based local generation only if you trust your device and the browser environment.
- For most users, a reputable password manager remains the most user-friendly and secure option; this tool can be helpful for users who prefer local deterministic generation or want an alternative approach.

## Disclaimer
I am not an expert in this area. This is a personal project and not professional security advice. Use this tool at your own risk. Verify its suitability for your needs and consult a security professional if you require a higher assurance. No warranties are provided.

## Technical Details
- This generator uses PBKDF2 with SHA-512 and 100,000 iterations.
- Min/Max password length: 8–64 characters
- Min/Max salt length: 8–32 characters
- Generated password always includes at least one character of each character class based on output alphabet (character classes: lower, upper, numeric, special)
- Possible Alphabets for generated password (input alphabet is Advanced):
    - Base: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`
    - Simple: Base + `!@#$%*()-_=+.?`
    - Advanced: Simple + `[]{}<>^&;:,`
