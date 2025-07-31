#import "AppDelegate.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    
    // Create a simple view controller with SnapBite text
    UIViewController *rootViewController = [[UIViewController alloc] init];
    rootViewController.view.backgroundColor = [UIColor whiteColor];
    
    // Add SnapBite label
    UILabel *titleLabel = [[UILabel alloc] init];
    titleLabel.text = @"SnapBite";
    titleLabel.font = [UIFont boldSystemFontOfSize:36];
    titleLabel.textAlignment = NSTextAlignmentCenter;
    titleLabel.frame = CGRectMake(0, 0, 300, 100);
    titleLabel.center = rootViewController.view.center;
    [rootViewController.view addSubview:titleLabel];
    
    self.window.rootViewController = rootViewController;
    [self.window makeKeyAndVisible];
    
    return YES;
}

@end