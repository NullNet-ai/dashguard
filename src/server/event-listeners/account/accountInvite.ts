import { replaceTemplateVariables } from '~/lib/template-parser';
import { api } from '~/trpc/server';
import { sendEmail } from '~/lib/email-helper';
import { headers } from 'next/headers';

export const accountInvite = async (eventName: string, data: any) => {
  try {
    const { loggedInUser,invitationRecord, account_record_id } = data;
    const communicationTemplate =
      await api.communicationTemplate.getCommunicationTemplate({
        eventName,
      });
   
    const { subject, content } = communicationTemplate ?? {};

    const headerList = headers();
    const host = headerList.get('host'); // Get the host from request headers
    const protocol = headerList.get('x-forwarded-proto') || 'http'; // Detect if running on HTTPS

    const baseURL = `${protocol}://${host}`; // Construct base URL

    const invitationLink = `${baseURL}/invite/${invitationRecord?.id}`;
    const accoutnDetails = await api.account.getAccountDetails({
      id: account_record_id,
    });
    const templateData = {
      ...accoutnDetails,
      link: invitationLink,
    };
    const parsedSubject = replaceTemplateVariables(subject, templateData);
    const parsedContent = replaceTemplateVariables(content, templateData);
    await sendEmail({
      from: loggedInUser.email,
      to: templateData.organization_account.email,
      subject: parsedSubject,
      html: parsedContent,
    });
  } catch (error) {
    console.error('🚀 ~ accountInvite ~ error:', data);
    throw error;
  }
};
