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
### Recommendations
- Generated password should be at least 12 characters long.
- Use a unique salt per account (site-specific salt) to ensure different derived passwords for different accounts.
- Ensure the generated password complies with the target site's password policy (allowed characters, required symbols, maximum length, etc.). Refer to the *Technical Details* section for the character sets used by this generator.
- Using a larger character alphabet increases password strength.
- If you use a single master password with different salts, make sure the master password itself is sufficiently strong.
- Use browser-based local generation only if you trust your device and the browser environment.
- For most users, a reputable password manager remains the most user-friendly and secure option; This tool is intended for users who prefer deterministic, local password generation or want an alternative approach.
### Security of This Tool
- This approach significantly improves resistance against generalized attacks compared to using simpler, memorable passwords.
- If an attacker specifically targets you and knows you use this scheme, security depends heavily on the strength of your initial password and the secrecy of your salt. A weak initial password can make the derived password vulnerable.
- Local password generation avoids remote storage or transmission, but it does not protect against a compromised device or malicious browser environment.
- If a website or application handles passwords insecurely (e.g. missing TLS or weak server-side storage), using a longer or more complex derived password may help mitigate the risk.


## Downloadable Offline Password Generator
- Based on the online version of the password generator
- Download the 'password_generator_offline' folder
- Run one of the 'start_' files
- While the terminal window is open, the password generator is hosted as a local website
- Closing the terminal window will stop the local server

## Disclaimer
I am not an expert in this area. This is a personal project and not professional security advice. Use this tool at your own risk. Verify its suitability for your needs and consult a security professional if you require a higher assurance. No warranties are provided.

## Technical Details
- This generator uses PBKDF2 with SHA-512 and 100,000 iterations.
- Min/Max password length: 8–64 characters
- Min/Max salt length: 8–32 characters
- Salt is expanded by 8 byte default salt
- Generated password always includes at least one character of each character class based on output alphabet (character classes: lower, upper, numeric, special)
- Possible Alphabets for generated password (input alphabet is Advanced):
    - Base: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`
    - Simple: Base + `!@#$%*()-_=+.?`
    - Advanced: Simple + `[]{}<>^&;:,`
### Algorithm
1. Validate input parameters (password, salt, length, outputAlphabet)
2. Combine a fixed default salt with the user-provided salt
3. Determine required character sets based on the selected output alphabet  
   (lowercase, uppercase, numeric, and optionally special characters)
4. Calculate the number of bytes required for character generation and shuffling
5. Derive a deterministic byte array using PBKDF2 (SHA-512)
6. Map the first bytes to ensure at least one character from each required character set
7. Map additional bytes to the full output alphabet until the desired length is reached
8. Perform a deterministic shuffle using remaining derived bytes
9. Return the final generated password
