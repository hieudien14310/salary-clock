import { Clock3, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import PATH from '@/constants/path';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const isDarkMode =
    theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header className="border-b">
      <div className="flex items-center justify-between gap-4 p-3">
        <Link
          to={PATH.HOME}
          aria-label="Salary — Trang chủ"
          className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clock3 className="size-4" aria-hidden="true" />
          </span>
          <span className="flex h-8 flex-col justify-between">
            <span className="text-lg leading-none font-semibold tracking-tight">Salary</span>
            <span className="text-xs leading-none text-muted-foreground">Mỗi giây đều có giá trị.</span>
          </span>
        </Link>
        <div className="flex items-center gap-5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={isDarkMode ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
          >
            {isDarkMode ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
