import { formatDate } from '~/server/utils/formatDate'

const INVITATION_LINK_EXPIRED = parseInt(
  process.env.INVITATION_LINK_EXPIRED || '1', 10,
)

export const isInvitationLinkExpired = (
  createdDate: string,
  createdTime?: string,
): boolean => {
  const created = new Date(
    `${createdDate}${createdTime ? ' ' + createdTime : ''}`,
  )
  const expirationDate = new Date(created)
  expirationDate.setDate(created.getDate() + INVITATION_LINK_EXPIRED)
  const currentDate = formatDate(new Date())
  const resolvedCurrentDate = new Date(`${currentDate.date} ${currentDate.time}`)

  return resolvedCurrentDate > expirationDate
}
