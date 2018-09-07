/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

#import <Firebase.h>



#define SYSTEM_VERSION_GRATERTHAN_OR_EQUALTO(v)  ([[[UIDevice currentDevice] systemVersion] compare:v options:NSNumericSearch] != NSOrderedAscending)

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
 // [Fabric with:@[[Crashlytics class]]];

  [FIRApp configure];
  NSURL *jsCodeLocation;
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];

  self.rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"tdemconnect"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  self.rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];
  
  if(SYSTEM_VERSION_GRATERTHAN_OR_EQUALTO(@"10.0")){
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;
    [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge) completionHandler:^(BOOL granted, NSError * _Nullable error){
      if(!error){
        dispatch_async(dispatch_get_main_queue(), ^{
          [[UIApplication sharedApplication] registerForRemoteNotifications];
          
          
        });
      }
    }];
  }
  else {
    // Code for old versions
  }

  NSDictionary *notification = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  if (notification) {
    NSLog(@"app recieved notification from remote%@",notification);
    [self application:application didReceiveRemoteNotification:notification];
  } else {
    NSLog(@"app did not recieve notification");
  }
 
  
//  // Create a Mutable Dictionary to hold the appProperties to pass to React Native.
//  NSMutableDictionary *appProperties = [NSMutableDictionary dictionary];
//
//  if (launchOptions != nil) {
//    // Get Local Notification used to launch application.
//    UILocalNotification *notification = [launchOptions objectForKey:UIApplicationLaunchOptionsLocalNotificationKey];
//
//    if (notification) {
//      // Instead of passing the entire Notification, we'll pass the userInfo,
//      // where a Record ID could be stored, for example.
//      NSDictionary *notificationUserInfo = [notification userInfo];
//
//      [ appProperties setObject:notificationUserInfo  forKey:@"initialNotificationUserInfo" ];
//    }
//  }
//
//  // Your RCTRootView stuff...
//
//  self.rootView.appProperties = appProperties;
  
  
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = self.rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application
{
  [self onAppActiveStateChanged:NO];
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
  [self onAppActiveStateChanged:YES];
}

- (void)application:(UIApplication *)application
didReceiveLocalNotification:(UILocalNotification *)notification
{
  
  /* your Code*/
}

-(void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
  
  if ( application.applicationState == UIApplicationStateInactive || application.applicationState == UIApplicationStateBackground  )
  {
    //opened from a push notification when the app was on background
    NSMutableDictionary *newProps = [NSMutableDictionary dictionary];
    if (self.rootView.appProperties != nil) {
      [newProps addEntriesFromDictionary:self.rootView.appProperties];
    }
    newProps[@"fromPushnoti"] = @(1);
    self.rootView.appProperties = newProps;
  }
  
  
//  if ([UIApplication sharedApplication].applicationState == UIApplicationStateActive) {
//    NSLog(@"Notification received by running app");
//    NSMutableDictionary *newProps = [NSMutableDictionary dictionary];
//    if (self.rootView.appProperties != nil) {
//      [newProps addEntriesFromDictionary:self.rootView.appProperties];
//    }
//    newProps[@"fromPushnoti"] = @(0);
//    self.rootView.appProperties = newProps;
//
//
//  } else {
//    NSLog(@"App opened from Notification");
//    NSMutableDictionary *newProps = [NSMutableDictionary dictionary];
//    if (self.rootView.appProperties != nil) {
//      [newProps addEntriesFromDictionary:self.rootView.appProperties];
//    }
//    newProps[@"fromPushnoti"] = @(0);
//    self.rootView.appProperties = newProps;
//
//  }
}

//Called when a notification is delivered to a foreground app.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler{
  NSLog(@"User Info : %@",notification.request.content.userInfo);
  completionHandler(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge);
}

//Called to let your app know which action was selected by the user for a given notification.
//-(void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void(^)())completionHandler{
//  NSLog(@"User Info : %@",response.notification.request.content.userInfo);
//  completionHandler();
//}

// check income application

-(void)onAppActiveStateChanged:(BOOL)appBecameActive
{
  NSMutableDictionary *newProps = [NSMutableDictionary dictionary];
  if (self.rootView.appProperties != nil) {
    [newProps addEntriesFromDictionary:self.rootView.appProperties];
  }
  newProps[@"appDidBecomeActive"] = @(appBecameActive);
  self.rootView.appProperties = newProps;
}

@end
