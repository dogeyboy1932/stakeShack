// 'use client';

// import { createContext, useContext, useEffect, useState } from "react";
// import { usePathname } from "next/navigation";

// // Navigation context to force refresh on page changes
// const NavigationContext = createContext<{ navigationKey: number }>({ navigationKey: 0 });

// export function useNavigation() {
//   return useContext(NavigationContext);
// }

// export function NavigationProvider({ children }: { children: React.ReactNode }) {
//   const [navigationKey, setNavigationKey] = useState(0);
//   const pathname = usePathname();

//   useEffect(() => {
//     // Increment navigation key whenever pathname changes
//     console.log('Navigation detected:', pathname);
//     setNavigationKey(prev => prev + 1);
//   }, [pathname]);

//   return (
//     <NavigationContext.Provider value={{ navigationKey }}>
//       {children}
//     </NavigationContext.Provider>
//   );
// } 