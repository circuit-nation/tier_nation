import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

import { AppLayout } from '@/app/layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

function getErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return (
      error.data?.message ??
      error.statusText ??
      'An unexpected routing error occurred.'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while rendering this page.';
}

export function RootRouteErrorBoundary() {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const heading = isRouteErrorResponse(error)
    ? error.statusText
    : 'Unexpected Error';
  const details = getErrorMessage(error);

  return (
    <AppLayout>
      <section className="mx-auto mt-8 max-w-2xl">
        <Card className="rounded-3xl border-border/90 bg-card/70 shadow-2xl shadow-black/20">
          <CardHeader>
            <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
              Route error
            </p>
            <CardTitle className="text-xl sm:text-2xl">
              {status}: {heading}
            </CardTitle>
            <CardDescription className="text-sm">
              This page crashed. You can safely return home or try again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-xl border border-border/70 bg-background/70 p-3 text-xs text-muted-foreground">
              {details}
            </pre>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
            <Button asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </AppLayout>
  );
}
