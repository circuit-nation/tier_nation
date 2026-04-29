import logo from '@/assets/logo.svg';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { IconBrandGoogleFilled } from '@tabler/icons-react';

export function LoginPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center">
            {/* Radial gradient background */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center -z-10 bg-radial from-primary/20 from-10% to-background" />

            <Card className="w-full max-w-sm bg-background/80 backdrop-blur-xl rounded-2xl border border-background">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-x-2">
                        <div className="flex flex-col items-center gap-3">
                            <img
                                src={logo}
                                alt={`${APP_NAME} logo`}
                                className="size-14 rounded-md object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-medium">{APP_NAME}</h1>
                            <p className='text-xs text-muted-foreground'>
                                A product of Circuit Nation.
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">

                    {/* Sign In Button */}
                    <Button className="w-full gap-2 text-white" size="lg" variant="default">
                        <IconBrandGoogleFilled size={24} />
                        Continue with Google
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
}
