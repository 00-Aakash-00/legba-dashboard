// User-facing strings for this area. Owned by the auth builder.

export const auth = {
  showcase: {
    label: "Legba highlights",
    slides: [
      {
        lead: "Cloud, Edge, and ",
        accent: "AI Solutions",
        body: "Legba accelerates AI training, provides comprehensive cloud services, improves content delivery, and protects servers and applications.",
      },
      {
        lead: "Private by default with ",
        accent: "Ghost Mode",
        body: "Maximum privacy. No traces. Built for operators.",
      },
      {
        lead: "Protected workloads with ",
        accent: "Shield Mode",
        body: "Enterprise-grade protection for your AI workloads.",
      },
    ],
    goTo: (n: number, total: number) => `Show slide ${n} of ${total}`,
    slide: (n: number, total: number) => `${n} of ${total}`,
  },
  login: {
    title: "Login",
    headingLines: ["Welcome back to", "Inference Box!"],
    subtitle: "Enter your username and password to continue.",
    email: "Email",
    emailPlaceholder: "you@company.com",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    remember: "Remember me",
    forgot: "Forgot password?",
    submit: "Log in",
    pending: "Logging in",
    divider: "Or login with",
    sso: "SSO",
    google: "Google",
    github: "GitHub",
    noAccount: "Don't have an account?",
    register: "Register",
    legalLead: "By logging in, you agree to our ",
    msa: "Master Services Agreement",
    and: " and ",
    privacy: "Privacy Policy",
    invalid:
      "That email and password don't match. Check them and try again, or reset your password.",
    unreachable:
      "Couldn't reach the server. Check your connection and try again.",
    providerUnavailable: (provider: string) =>
      `${provider} sign-in isn't available yet. Use your email and password instead.`,
  },
  register: {
    title: "Create account",
    heading: "Create your account",
    subtitle: "Start building with Inference Box.",
    name: "Full name",
    namePlaceholder: "Jane Doe",
    email: "Work email",
    password: "Password",
    passwordPlaceholder: "Create a password",
    rulesLabel: "Your password needs",
    rules: {
      length: "At least 8 characters",
      mix: "A letter and a number",
    },
    submit: "Create account",
    pending: "Creating account",
    haveAccount: "Already have an account?",
    login: "Log in",
    legalLead: "By creating an account, you agree to our ",
    emailTaken:
      "That email is already registered. Log in instead, or use a different email.",
  },
  forgot: {
    title: "Reset password",
    heading: "Reset your password",
    subtitle: "Enter your email and we'll send you a reset link.",
    submit: "Send reset link",
    pending: "Sending",
    sent: (email: string) =>
      `If an account exists for ${email}, a reset link is on its way. Check your inbox.`,
    back: "Back to log in",
  },
  sso: {
    title: "Single sign-on",
    heading: "Log in with SSO",
    subtitle: "Enter your work email to find your organization's sign-in.",
    submit: "Continue",
    pending: "Checking",
    notConfigured: (domain: string) =>
      `SSO isn't set up for ${domain} yet. Ask your admin, or log in with your email and password.`,
    back: "Back to log in",
  },
  fields: {
    nameRequired: "Enter your name.",
    nameTooLong: "Use 80 characters or fewer.",
    emailRequired: "Enter your email address.",
    emailInvalid: "Enter a valid email address, like name@company.com.",
    passwordRequired: "Enter your password.",
    passwordWeak: "Use at least 8 characters, with a letter and a number.",
  },
};
