import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import supabase from "../lib/supabase";
import { ROUTE_PATHS } from "./routePaths";
import Footer from "../components/Footer";
import LoadingScreen from "../components/LoadingScreen";

const LandingPage = lazy(() => import("../views/landing/LandingPage"));
const AdminLogin = lazy(() => import("../views/admin/Admin"));
const Login = lazy(() => import("../views/auth/Login"));
const Signup = lazy(() => import("../views/auth/SignUp"));
const ForgotPassword = lazy(() => import("../views/auth/Forgotpass"));
const DriversPage = lazy(() => import("../views/drivers/DriversPage"));
const DriverDetail = lazy(() => import("../views/drivers/DriverDetails"));
const Teams = lazy(() => import("../views/teams/Teams"));
const TeamDetail = lazy(() => import("../views/teams/TeamDetail"));
const CircuitPage = lazy(() => import("../views/circuits/Circuits"));
const CircuitDetail = lazy(() => import("../views/circuits/CircuitDetail"));
const Calendar = lazy(() => import("../views/calendar/Calendar"));
const CalendarDetail = lazy(() => import("../views/calendar/CalendarDetail"));
const AdminDashboard = lazy(() => import("../views/admin/AdminDB"));
const Store = lazy(() => import("../views/store/Store"));
const MyAccount = lazy(() => import("../views/account/MyAccount"));

export default function AppRoutes() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setIsLoggedIn(Boolean(session?.user));
      setSessionChecked(true);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
      setSessionChecked(true);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  if (!sessionChecked) {
    return null;
  }

  const hideFooter = location.pathname.startsWith(ROUTE_PATHS.ADMIN_DASHBOARD);
  const isMiniStore = location.pathname.startsWith(ROUTE_PATHS.STORE);

  return (
    <div className="app-shell">
      <div className="app-shell-main">
        <div className="app-route-fade" key={location.key || location.pathname}>
          <Suspense fallback={<LoadingScreen message="Loading page..." />}>
          <Routes location={location}>
            <Route
              path={ROUTE_PATHS.ROOT}
              element={<Navigate to={ROUTE_PATHS.LANDING} replace />}
            />

            <Route path={ROUTE_PATHS.LANDING} element={<LandingPage />} />

            <Route path={ROUTE_PATHS.ADMIN_DASHBOARD} element={<AdminDashboard />} />
            <Route path={ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE} element={<AdminDashboard />} />
            <Route path={ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_USERS} element={<AdminDashboard />} />
            <Route path={ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_PRODUCTS} element={<AdminDashboard />} />
            <Route path={ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_DISCOUNTS} element={<AdminDashboard />} />
            <Route path={ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_BILLINGS} element={<AdminDashboard />} />
            <Route path={ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_ORDERS} element={<AdminDashboard />} />
            <Route path={ROUTE_PATHS.ADMIN_DASHBOARD_MINISTORE_CARTS} element={<AdminDashboard />} />

            <Route path={ROUTE_PATHS.ADMIN_LOGIN} element={<AdminLogin />} />
            <Route path={ROUTE_PATHS.LOGIN} element={<Login />} />
            <Route path={ROUTE_PATHS.SIGNUP} element={<Signup />} />
            <Route path={ROUTE_PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />

            <Route path={ROUTE_PATHS.TEAMS} element={<Teams />} />
            <Route path={ROUTE_PATHS.TEAM_DETAIL} element={<TeamDetail />} />

            <Route path={ROUTE_PATHS.DRIVERS} element={<DriversPage />} />
            <Route path={ROUTE_PATHS.DRIVER_DETAIL} element={<DriverDetail />} />

            <Route path={ROUTE_PATHS.CALENDAR} element={<Calendar />} />
            <Route path={ROUTE_PATHS.CALENDAR_DETAIL} element={<CalendarDetail />} />

            <Route path={ROUTE_PATHS.CIRCUITS} element={<CircuitPage />} />
            <Route path={ROUTE_PATHS.CIRCUIT_DETAIL} element={<CircuitDetail />} />

            <Route path={ROUTE_PATHS.STORE} element={<Store />} />
            <Route path={ROUTE_PATHS.ACCOUNT} element={<MyAccount />} />
          </Routes>
          </Suspense>
        </div>
      </div>
      {hideFooter ? null : <Footer variant={isMiniStore ? "ministore" : "default"} />}
    </div>
  );
}
