import { useLocation } from "react-router-dom";
import { sidebarConfig } from "./Sidebar/sidebarConfig";

// Create a map: path => breadcrumb trail (as an array of strings)
function generateBreadcrumbMap(config) {
  const map = {
    "/dashboard": ["Dashboard"],
  };

  function traverse(items, parentTrail = ["Dashboard"]) {
    for (const item of items) {
      const currentTrail = [...parentTrail, item.label];
      if (item.href) {
        map[item.href] = currentTrail;
      }
      if (item.items) {
        traverse(item.items, currentTrail);
      }
    }
  }

  // Traverse all roles and shared config
  Object.values(config).forEach((section) => {
    if (Array.isArray(section)) {
      traverse(section);
    }
  });

  return map;
}

const breadcrumbMap = generateBreadcrumbMap(sidebarConfig);

// Resolve the last label for a given pathname
function resolveBreadcrumbTitle(pathname) {
  // Exact match
  if (breadcrumbMap[pathname]) {
    return breadcrumbMap[pathname].slice(-1)[0];
  }

  // Fallback: match longest prefix
  const matchedPath = Object.keys(breadcrumbMap)
    .filter((path) => pathname.startsWith(path))
    .sort((a, b) => b.length - a.length)[0];

  return matchedPath ? breadcrumbMap[matchedPath].slice(-1)[0] : "Dashboard";
}

// 👇 This hook returns just the final breadcrumb label
export function useBreadcrumbTitle() {
  const location = useLocation();
  return resolveBreadcrumbTitle(location.pathname);
}
