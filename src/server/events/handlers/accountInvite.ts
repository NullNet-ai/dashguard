'use server'
import { type TMethod, createSchedule, dateToCron } from '~/lib/createSchedule';
import { api } from '~/trpc/server';
import { replaceTemplateVariables } from '~/lib/template-parser';
import { sendEmail } from '~/lib/email-helper';
import { formatDate } from '~/server/utils/formatDate';
import { headers } from 'next/headers';
const INVITATION_LINK_EXPIRED = parseInt(
  process.env.INVITATION_LINK_EXPIRED || '1',
  10,
);
export const eventHandler = async (eventName: string, data: any) => {
  try {
    const { loggedInUser, invitationRecord, account_record_id } = data;
    const communicationTemplate =
      await api.communicationTemplate.getCommunicationTemplate({
        eventName,
      });

    if (!communicationTemplate) {
      throw new Error('Communication template not found');
    }

    const { subject, content } = communicationTemplate ?? {};

    const headerList = await headers();
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
      from: loggedInUser.account_id,
      to: templateData.account_organization.email,
      subject: parsedSubject,
      html: parsedContent,
    });
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + INVITATION_LINK_EXPIRED);
    const cronTime = dateToCron(new Date(formatDate(expirationDate).dataTime));
    const scheduleConfig = {
      enabled: true,
      cron: cronTime,
      callback_url: `${baseURL}/api/account/invitation-expire`,
      method: 'POST' as TMethod,
      parameters: {
        account_id: account_record_id,
        invitation_id: invitationRecord?.id,
      },
      wait_for_completion: true,
    };
    createSchedule(scheduleConfig);
  } catch (error) {
    console.error('🚀 ~ accountInvite ~ error:', error);
    throw error;
  }
};
