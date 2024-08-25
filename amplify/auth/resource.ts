import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailStyle: "CODE",
      verificationEmailSubject: "Welcome to Grow A Tale",
      verificationEmailBody: (createCode) => `Use this code to confirm your Grow A Tale account: ${createCode()}`,
    },
  },
});