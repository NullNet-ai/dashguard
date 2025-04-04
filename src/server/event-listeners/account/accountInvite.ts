'use server'
import { replaceTemplateVariables } from '~/lib/template-parser';
import { sendAccountInvitation } from '../actions/sendAccountInvitation';

export const accountInvite = async (data: any) => {
  try {
    const { communicationTemplate, loggedInUser, ...templateData } = data;

    const {
      subject,
      content,
    } = communicationTemplate;

    const parsedSubject = replaceTemplateVariables(subject, templateData);
    console.log("🚀 ~ accountInvite ~ parsedSubject:", parsedSubject)
    const parsedContent = replaceTemplateVariables(content, templateData);
    console.log("🚀 ~ accountInvite ~ parsedContent:", parsedContent)
    // await sendEmail({
    //   from: loggedInUser.email, 
    //   to: templateData.organization_account.email,
    //   subject: parsedSubject,
    //   html: parsedContent,
    // })
    await sendAccountInvitation(templateData?.organization_account?.id)
  
    
  } catch (error) {
    console.log('🚀 ~ accountInvite ~ error:', data);
  }
};
