import { Alert, AlertIcon, AlertTitle } from '@wyze/ui/components/alert'
import { ConstructionIcon } from 'lucide-react'

export default function HomeRoute() {
  return (
    <>
      <head>
        <title>Tick</title>
      </head>
      <div className="flex justify-center p-20">
        <Alert appearance="light" className="max-w-lg" variant="primary">
          <AlertIcon>
            <ConstructionIcon />
          </AlertIcon>
          <AlertTitle>We are under construction</AlertTitle>
        </Alert>
      </div>
    </>
  )
}
