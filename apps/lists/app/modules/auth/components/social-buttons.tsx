import { Icon } from '@wyze/icons'
import { Button } from '@wyze/ui/button'
import { Form } from 'react-router'

import { useAuthAction } from '../hooks/use-auth-action'

export function SocialButtons() {
  const { action, pathname } = useAuthAction()

  return (
    <>
      <div className="grid gap-3">
        <Form action={pathname} className="flex flex-col gap-4" method="post">
          <Button
            className="w-full"
            name="intent"
            type="submit"
            value="social"
            variant="outline"
          >
            <input type="hidden" name="provider" value="github" />
            <Icon name="github" />
            {action} with GitHub
          </Button>
        </Form>
        <Form action={pathname} className="flex flex-col gap-4" method="post">
          <Button
            className="w-full"
            name="intent"
            type="submit"
            value="social"
            variant="outline"
          >
            <input type="hidden" name="provider" value="google" />
            <Icon name="google" />
            {action} with Google
          </Button>
        </Form>
      </div>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-border after:border-t">
        <span className="relative z-10 bg-card px-2 text-muted-foreground">
          Or continue with
        </span>
      </div>
    </>
  )
}
