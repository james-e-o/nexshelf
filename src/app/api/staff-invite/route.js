import { Resend } from "resend";
import Image from "next/image";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
    const { email, companyName, link } = await req.json();
    console.log(email,companyName)
    const companyLogo ='../../../../public/logo.png'

  const response = await resend.emails.send({
    from: `onwuasoanyajames@gmail.com`,
    to: email,
    subject: `${companyName} has invited you to join their company`,
    html: `
      <div>
        <img src="${companyLogo}" width="120" />
        <h2>${companyName} Invitation</h2>
        <p>You have been invited to join ${companyName} on Nexshelf.</p>
        <a href="${link}">Click here to complete your onboarding</a>
      </div>
    `
  });

  return Response.json({ status: "sent", response });
}

