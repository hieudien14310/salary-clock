import { CircleAlert, FileQuestion, House, RotateCcw } from 'lucide-react';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty';
import PATH from '@/constants/path';

const ErrorBoundaryPage = () => {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const ErrorIcon = isNotFound ? FileQuestion : CircleAlert;

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-3" aria-labelledby="error-title">
      <div className="w-full max-w-lg space-y-6">
        <p className="text-center text-sm font-medium text-muted-foreground">Salary · Mỗi giây đều có giá trị.</p>
        <Card className="py-0">
          <Empty className="gap-6 p-6 sm:p-10">
            <EmptyHeader className="max-w-none gap-3">
              <EmptyMedia variant="icon" className="size-14 rounded-2xl">
                <ErrorIcon className="size-7" aria-hidden="true" />
              </EmptyMedia>
              {isNotFound && <p className="text-sm font-medium text-muted-foreground">Lỗi 404</p>}
              <h1 id="error-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {isNotFound ? 'Không tìm thấy trang' : 'Đã có lỗi xảy ra'}
              </h1>
              <EmptyDescription>
                {isNotFound
                  ? 'Đường dẫn này không tồn tại. Hãy về trang chủ để tiếp tục theo dõi thu nhập của bạn.'
                  : 'Salary chưa thể hiển thị trang này. Bạn có thể tải lại trang hoặc về trang chủ để thử lại.'}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="max-w-none gap-3 sm:flex-row sm:justify-center">
              {!isNotFound && (
                <Button type="button" size="lg" className="w-full sm:w-auto" onClick={() => window.location.reload()}>
                  <RotateCcw aria-hidden="true" />
                  Tải lại trang
                </Button>
              )}
              <Button
                nativeButton={false}
                render={<a href={PATH.HOME} />}
                variant={isNotFound ? 'default' : 'outline'}
                size="lg"
                className="w-full sm:w-auto"
              >
                <House aria-hidden="true" />
                Về trang chủ
              </Button>
            </EmptyContent>
          </Empty>
        </Card>
      </div>
    </main>
  );
};

export default ErrorBoundaryPage;
