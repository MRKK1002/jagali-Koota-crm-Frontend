// // import { useAuth } from "@/hooks/useAuth";      // ✅ Correct
// // import { AuthProvider } from "@/hooks/useAuth"; // ✅ if needed

// import { useAuth } from "Dashboard/context/AuthContext";
// import { AuthProvider } from "Dashboard/context/AuthContext";

// export const useAuth = () => {
//   const context = useContext(AuthContext);
  
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
  
//   return context;
// };