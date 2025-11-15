const emailTemplates = {
    adminWelcomeEmailTemplate: (name: string, password: string) => `
    <h1>Welcome, ${name} </h1>

    <p> You are now an administrator at NovelWeb.</p>
    <p> Your password is <b>${password}</b>. We advise you to change it immediately after logging in.  </p>

    <p>Thank you for joining us </p>

    ` ,

    emailVerificationCodeTemplate: (email: string, verificationCode: string) => `
    <h1>Hello, ${email} </h1>

    <p> Welcome to NovelWeb.</p>
    <p> Your email verification code is <b>${verificationCode}</b>. We advise you to use it as soon as possible as it expires in 30 minutes.  </p>

    <p>Thank you for joining us </p>

    ` ,
    passwordChangeCodeTemplate: (email: string, verificationCode: string) => `
    <h1>Hello, ${email} </h1>

    <p> Your OTP code  for a password change request is <b>${verificationCode}</b>. We advise you to use it as soon as possible as it expires in 30 minutes.  </p>

    <p>If you did not make this request, please ignore this mail. </p>

    ` ,
    
}

export default emailTemplates