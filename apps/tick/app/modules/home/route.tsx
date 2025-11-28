import { Button } from '@wyze/ui/components/button'
import { Calendar } from '@wyze/ui/components/calendar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@wyze/ui/components/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from '@wyze/ui/components/field'
import { Input } from '@wyze/ui/components/input'
import {
  Popover,
  PopoverContent,
  PopoverPositioner,
  PopoverTrigger,
} from '@wyze/ui/components/popover'
import { ScrollArea } from '@wyze/ui/components/scroll-area'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { ChevronDownIcon } from 'lucide-react'
import * as React from 'react'
import { Form, redirect } from 'react-router'
import * as v from 'valibot'

import { getTimezone } from '~/helpers/get-timezone'

import type { Route } from './+types/route'

type State = {
  open: boolean
  date: dayjs.Dayjs
}

type Action =
  | { type: 'open'; data: State['open'] }
  | { type: 'date'; data: State['date'] }

dayjs.extend(advancedFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

const FormSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.transform((value) => (value === '' ? null : value))
  ),
  target: v.pipe(
    v.string(),
    v.transform((value) => dayjs(value))
  ),
})

function base62(start: number) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let value = ''
  let counter = start

  while (counter > 0) {
    value = chars[counter % 62] + value
    counter = Math.floor(counter / 62)
  }

  return value || '0'
}

function slug() {
  const length = 7
  const array = new Uint8Array(length)

  crypto.getRandomValues(array)

  return Array.from(array)
    .map((value) => base62(value % 62))
    .join('')
    .slice(0, length)
}

export function meta() {
  return [{ title: 'Tick' }]
}

export async function action({ context, request }: Route.ActionArgs) {
  const form = v.safeParse(
    FormSchema,
    Object.fromEntries(await request.formData())
  )

  if (!form.success) {
    return form.issues.reduce<Record<string, string>>((acc, issue) => {
      const key = `${issue.path?.at(0)?.key ?? 'Unknown'}`

      acc[key] = issue.message

      return acc
    }, {})
  }

  if (form.output.target.isBefore()) {
    return { target: 'Target time cannot be in the past.' }
  }

  const timer = {
    createdAt: dayjs().toISOString(),
    expiresAt: form.output.target.toISOString(),
    label: form.output.name,
    slug: slug(),
  }

  await context.cloudflare.env.TIMERS.put(
    `timer:${timer.slug}`,
    JSON.stringify(timer)
  )

  return redirect(`/timer/${timer.slug}`)
}

export function loader({ context }: Route.LoaderArgs) {
  const tz = getTimezone(context)
  const now = dayjs().tz(tz).startOf('hour').toJSON()

  return { now, tz }
}

function reducer(state: State, action: Action): State {
  // biome-ignore lint/style/useDefaultSwitchClause: This switch statement is type safe
  switch (action.type) {
    case 'date':
      return { ...state, date: action.data, open: false }
    case 'open':
      return { ...state, open: action.data }
  }
}

const times = new Array(24)
  .fill(0)
  .flatMap(
    (_, index) =>
      [
        [index, 0],
        [index, 30],
      ] as const
  )
  .map(([hour, minutes]) =>
    dayjs().year(1970).month(0).date(1).hour(hour).minute(minutes)
  )

function TimeSlots({
  date,
  dispatch,
  now,
}: {
  date: dayjs.Dayjs
  dispatch: React.ActionDispatch<[action: Action]>
  now: dayjs.Dayjs
}) {
  return (
    <div className="relative w-full max-sm:h-48 sm:w-40">
      <div className="absolute inset-0 py-4 max-sm:border-t">
        <ScrollArea className="h-full sm:border-s">
          <div className="space-y-3">
            <div className="flex h-5 shrink-0 items-center px-5">
              <p className="font-medium text-sm">
                {date ? date.format('dddd, Do') : 'Pick a date'}
              </p>
            </div>
            <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
              {times.map((time) => {
                const formatted = time.format('h:mm A')
                const available = date.isSame(now, 'day')
                  ? now.isBefore(date.clone().hour(time.hour()), 'hour')
                  : true

                return (
                  <Button
                    className="w-full"
                    disabled={!available}
                    key={formatted}
                    onClick={() =>
                      dispatch({
                        type: 'date',
                        data: date.hour(time.hour()).minute(time.minute()),
                      })
                    }
                    size="sm"
                    variant={
                      date.format('h:mm A') === formatted
                        ? 'default'
                        : 'outline'
                    }
                  >
                    {formatted}
                  </Button>
                )
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default function HomeRoute({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  const now = dayjs(loaderData.now).tz(loaderData.tz)
  const [{ open, date }, dispatch] = React.useReducer(reducer, {
    date: now.hour(now.hour() + 1),
    open: false,
  })

  const nameError = actionData?.name
  const targetError = actionData?.target

  return (
    <div className="flex justify-center p-20">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Create a Countdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post">
            <FieldSet>
              <FieldGroup>
                <Field
                  data-invalid={Boolean(nameError)}
                  orientation="responsive"
                >
                  <FieldContent>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <FieldDescription>
                      Optional name to display for the countdown.
                    </FieldDescription>
                    {nameError ? <FieldError>{nameError}</FieldError> : null}
                  </FieldContent>
                  <Input
                    aria-invalid={Boolean(nameError)}
                    id="name"
                    name="name"
                    placeholder="e.g. Launch party"
                  />
                </Field>
                <FieldSeparator />
                <Field
                  data-invalid={Boolean(targetError)}
                  orientation="responsive"
                >
                  <FieldContent>
                    <FieldLabel htmlFor="target">Target</FieldLabel>
                    <FieldDescription>
                      When do you want the countdown to end?
                    </FieldDescription>
                    {targetError ? (
                      <FieldError>{targetError}</FieldError>
                    ) : null}
                  </FieldContent>
                  <input name="target" type="hidden" value={date?.toJSON()} />
                  <Popover
                    onOpenChange={(data) => dispatch({ type: 'open', data })}
                    open={open}
                  >
                    <PopoverTrigger
                      className="w-48 justify-between font-normal"
                      id="date"
                      render={<Button variant="outline" />}
                    >
                      {date
                        ? dayjs(date).format('MMMM Do, YYYY - h:mm A')
                        : 'Select date'}
                      <ChevronDownIcon />
                    </PopoverTrigger>
                    <PopoverPositioner align="end">
                      <PopoverContent className="w-auto overflow-hidden p-0">
                        <div className="flex max-sm:flex-col">
                          <Calendar
                            captionLayout="dropdown"
                            disabled={{ before: now.toDate() }}
                            endMonth={now.add(2, 'year').endOf('year').toDate()}
                            id="target"
                            mode="single"
                            onSelect={(value) =>
                              dispatch({
                                type: 'date',
                                data: date
                                  .month(value.getMonth())
                                  .date(value.getDate())
                                  .year(value.getFullYear()),
                              })
                            }
                            required
                            selected={date.toDate()}
                            startMonth={now.toDate()}
                          />
                          <TimeSlots {...{ date, dispatch, now }} />
                        </div>
                      </PopoverContent>
                    </PopoverPositioner>
                  </Popover>
                </Field>
                <FieldSeparator />
                <Field orientation="responsive">
                  <Button type="submit">Create</Button>
                </Field>
              </FieldGroup>
            </FieldSet>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
