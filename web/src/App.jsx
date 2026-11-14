import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout';
import { AdminRoute, ProtectedRoute } from './components/layout/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const BooksPage = lazy(() => import('./pages/BooksPage'));
const BookDetailPage = lazy(() => import('./pages/BookDetailPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const ListingDetailPage = lazy(() => import('./pages/ListingDetailPage'));
const CreateListingPage = lazy(() => import('./pages/CreateListingPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/profile/OrdersPage'));
const ListingsPage = lazy(() => import('./pages/profile/ListingsPage'));
const WishlistPage = lazy(() => import('./pages/profile/WishlistPage'));
const MembershipPage = lazy(() => import('./pages/profile/MembershipPage'));
const NotificationsPage = lazy(() => import('./pages/profile/NotificationsPage'));
const EditProfilePage = lazy(() => import('./pages/profile/EditProfilePage'));
const ChangePasswordPage = lazy(() => import('./pages/profile/ChangePasswordPage'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));

export default function App() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-muted" role="status">Loading…</div>}>
      <Routes>
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/create" element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
          <Route path="/marketplace/:id" element={<ListingDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/profile/listings" element={<ProtectedRoute><ListingsPage /></ProtectedRoute>} />
          <Route path="/profile/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/profile/membership" element={<ProtectedRoute><MembershipPage /></ProtectedRoute>} />
          <Route path="/profile/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/profile/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
