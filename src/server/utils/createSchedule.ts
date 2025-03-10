import axios from 'axios'

export type TMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface ScheduleData {
  enabled: boolean
  cron: string
  callback_url: string
  method: TMethod
  headers?: Record<string, string>
  parameters?: Record<string, any>
  wait_for_completion?: boolean
}

const {
  SCHEDULE_API = 'http://api.events.dnamicro.net/api/v1/schedule',
  SCHEDULE_AUTH_API,
  SCHEDULE_USERNAME,
  SCHEDULE_PASSWORD,
} = process.env

export const dateToCron = (date: Date) => {
  const minutes = date.getMinutes()
  const hours = date.getHours()
  const dayOfMonth = date.getDate()
  const month = date.getMonth() + 1

  return `${minutes} ${hours} ${dayOfMonth} ${month} *`
}

async function getAuthToken() {
  if (!SCHEDULE_AUTH_API || !SCHEDULE_USERNAME || !SCHEDULE_PASSWORD) {
    throw new Error('Schedule authentication credentials are not defined')
  }

  try {
    const { data: authData } = await axios.post(
      SCHEDULE_AUTH_API, {
        username: SCHEDULE_USERNAME,
        password: SCHEDULE_PASSWORD,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    return authData.data?.[0]?.token as string
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Authentication failed: ${error.response?.data?.message || error.message}`)
    }
    throw error
  }
}

export async function createSchedule(scheduleData: ScheduleData) {
  try {
    if (!SCHEDULE_API) {
      throw new Error('SCHEDULE_API is not defined')
    }

    const token = await getAuthToken()

    const {
      enabled = true,
      cron,
      callback_url,
      method,
      headers = {},
      parameters = {},
      wait_for_completion = true,
    } = scheduleData

    const { data: result } = await axios.post(
      SCHEDULE_API, {
        data: {
          enabled,
          cron,
          callback_url,
          method,
          headers,
          parameters,
          wait_for_completion,
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      },
    )

    return result
  }
  catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to create schedule: ${error.response?.data?.message || error.message}`)
    }
    throw error
  }
}

// Usage example:
// const scheduleConfig = {
//   enabled: true,
//   cron: '* * * * *',
//   callback_url: 'http://10.1.10.252:3000/api/account/expire',
//   method: 'POST',
//   headers: {
//     'x-account-expire-id': '5409ea0b-8692-4582-b7e9-91486f346fcb',
//   },
//   parameters: {},
//   wait_for_completion: true,
// };
// await createSchedule(scheduleConfig);
