'use server'
import { headers } from 'next/headers'

import { type TMethod, createSchedule, dateToCron } from '~/lib/createSchedule'
import { sendEmail } from '~/lib/email-helper'
import { replaceTemplateVariables } from '~/lib/template-parser'
import { formatDate } from '~/server/utils/formatDate'
import { api } from '~/trpc/server'

const INVITATION_LINK_EXPIRED = parseInt(
  process.env.INVITATION_LINK_EXPIRED || '1', 10,
)

export const eventHandler = async (eventName: string, data: any) => {
  try {
    const { account_record_id, invitationRecord } = data
    const communicationTemplate
      = await api.communicationTemplate.getCommunicationTemplate({
        eventName,
      })

    if (!communicationTemplate) {
      throw new Error('Communication template not found')
    }

    const { subject, content } = communicationTemplate ?? {}

    const headerList = headers()
    const host = headerList.get('host')
    const protocol = headerList.get('x-forwarded-proto') || 'http'

    const baseURL = `${protocol}://${host}`

    const resetPasswordLink = `${baseURL}/reset-password/${invitationRecord?.id}`
    const accoutnDetails = await api.account.getAccountDetails({
      id: account_record_id,
    })
    const templateData = {
      ...accoutnDetails,
      link: resetPasswordLink,
    }

    const parsedSubject = replaceTemplateVariables(subject, templateData)
    const parsedContent = replaceTemplateVariables(content, templateData)
    await sendEmail({
      from: 'no-reply@dnamicro.com',
      to: templateData.account_organization.account_id,
      subject: parsedSubject,
      html: parsedContent,
    })
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + INVITATION_LINK_EXPIRED)
    const cronTime = dateToCron(new Date(formatDate(expirationDate).dataTime))

    const scheduleConfig = {
      enabled: true,
      cron: cronTime,
      callback_url: `${baseURL}/api/account/reset-password-expire`,
      method: 'POST' as TMethod,
      parameters: {
        invitation_id: invitationRecord?.id,
      },
      wait_for_completion: true,
    }
    await createSchedule(scheduleConfig)
  }
  catch (error) {
    console.error('🚀 ~ accountInvite ~ error:', error)
    throw error
  }
}
