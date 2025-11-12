const emailTemplates = {
    adminWelcomeEmailTemplate: (name: string, password: string) => `
    <h1>Welcome, ${name} </h1>

    <p> You are now an administrator at NovelWeb.</p>
    <p> Your password is <b>${password}</b>. We advise you to change it immediately after logging in.  </p>

    <p>Thank you for joining us </p>

    ` 
}

export default emailTemplates