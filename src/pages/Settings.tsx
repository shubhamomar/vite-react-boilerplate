import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/store/settingsStore';

export function SettingsPage() {
  const { theme, setTheme, density, setDensity } = useSettingsStore();

  const handleThemeChange = (isDark: boolean) => {
    setTheme(isDark ? 'dark' : 'light');
  };

  const handleDensityChange = (isCompact: boolean) => {
    setDensity(isCompact ? 'compact' : 'comfortable');
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-8 max-w-md">
        <section>
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="theme-switch">
                <span className="font-medium">Theme</span>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode.
                </p>
              </Label>
              <Switch
                id="theme-switch"
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label htmlFor="density-switch">
                <span className="font-medium">UI Density</span>
                <p className="text-sm text-muted-foreground">
                  Adjust the spacing for a more compact view.
                </p>
              </Label>
              <Switch
                id="density-switch"
                checked={density === 'compact'}
                onCheckedChange={handleDensityChange}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
