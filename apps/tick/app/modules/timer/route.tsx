import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@wyze/ui/components/card'
import dayjs from 'dayjs'
import calendar from 'dayjs/plugin/calendar'
import timezone from 'dayjs/plugin/timezone'
import * as React from 'react'
import * as v from 'valibot'

import { getTimezone } from '~/helpers/get-timezone'

import type { Route } from './+types/route'

dayjs.extend(calendar)
dayjs.extend(timezone)

const IsoTimestampSchema = v.pipe(
  v.string('Must be a string.'),
  v.isoTimestamp('Must be ISO formatted.')
)

const TimerSchema = v.object({
  createdAt: IsoTimestampSchema,
  expiresAt: IsoTimestampSchema,
  label: v.nullable(v.string()),
  slug: v.pipe(
    v.string('Must be a string.'),
    v.length(7, 'Must be length of 7.')
  ),
})

export function meta({ loaderData: { timer } }: Route.MetaArgs) {
  return [{ title: `${timer.label} :: Tick` }]
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  if (!params.slug) {
    throw new Response('Missing slug', { status: 400 })
  }

  const stored = await context.cloudflare.env.TIMERS.get(
    `timer:${params.slug}`,
    { type: 'json' }
  )

  if (!stored) {
    throw new Response('Not found', { status: 404 })
  }

  const parsed = v.parse(TimerSchema, stored)
  const tz = getTimezone(context)
  const timer = {
    ...parsed,
    label: parsed.label ?? dayjs(parsed.expiresAt).tz(tz).calendar(),
  }

  return { timer, tz, url: request.url }
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function format(value: number) {
  if (value <= 0) {
    return '00:00:00'
  }

  const total = Math.floor(value / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export default function TimerRoute({ loaderData }: Route.ComponentProps) {
  const [now, setNow] = React.useState(() => Date.now())
  const { timer, url } = loaderData
  const target = new Date(timer.expiresAt).getTime()

  // tick every 250ms for smoothness
  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250)

    return () => clearInterval(interval)
  }, [])

  const remaining = target - now
  const finished = remaining <= 0

  React.useEffect(() => {
    if (finished) {
      // small browser notification if allowed
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      } else if (Notification.permission === 'granted') {
        new Notification('Countdown finished!')
      }
    }
  }, [finished])

  return (
    <div className="flex justify-center p-20">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>{timer.label}</CardTitle>
          <CardDescription>
            Shareable link:{' '}
            <code className="rounded bg-slate-100 px-2 py-1">{url}</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="font-mono text-5xl">{format(remaining)}</div>
          <div className="mt-3 text-slate-500 text-sm">
            {finished ? 'Finished' : 'Time remaining'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
