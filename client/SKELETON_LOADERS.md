# Loading Skeletons Implementation

## Overview
A complete set of reusable skeleton loader components has been added to the Hostel Management System to provide better UX during data loading. Instead of showing spinner messages, pages now display skeleton placeholders that match the layout of actual content.

## Skeleton Components Available

All skeleton components are located in: **`client/src/components/SkeletonLoaders.jsx`**

### Basic Components

1. **`SkeletonPulse`** - Generic animated pulse element
   - Used as the building block for all other skeletons
   - Customizable with Tailwind classes
   ```jsx
   <SkeletonPulse className="h-6 w-48 rounded-lg" />
   ```

2. **`MinimalSkeleton`** - Lightweight single line skeleton
   - Quick loading state for small sections
   ```jsx
   <MinimalSkeleton height="h-6" width="w-full" />
   ```

3. **`TextSkeleton`** - Multi-line text paragraph skeleton
   - Shows multiple lines with the last line shorter
   ```jsx
   <TextSkeleton lines={3} /> {/* Shows 3 lines */}
   ```

### Page-Specific Skeletons

4. **`CardSkeleton`** - Generic card with header, content, and actions
   - Used for dashboard tiles and content cards
   - Shows title, description, and action buttons

5. **`DashboardGridSkeleton`** - 4-card grid layout
   - Perfect for dashboard pages showing module cards
   - Shows 2x2 grid on desktop, 1 column on mobile
   - Used in: **UserDashboard.jsx**

6. **`ProfileSkeleton`** - User profile layout
   - Shows avatar placeholder, basic info, and form fields
   - Responsive design for different screen sizes
   - Used in: **Profile.jsx**

7. **`HeaderSkeleton`** - Page header with title and subtitle
   - Large heading and description placeholder
   - Used by other page skeletons

8. **`StatsCardsSkeleton`** - 3-column statistics cards
   - Shows stat labels and number placeholders
   - Used in: **Complaints.jsx** (stats row)

9. **`ComplaintCardSkeleton`** - Full complaint/message card
   - Shows category icon, status badges, description
   - Includes reply section with message threads
   - Used in: **Complaints.jsx**, **AdminComplaints.jsx**

10. **`GalleryGridSkeleton`** - Image grid layout
    - Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
    - Aspect ratio preserved (square images)
    - Used in: **Gallery.jsx**

11. **`ListItemSkeleton`** - Expandable list item
    - Shows title, subtitle, and action buttons
    - Good for notification/message lists

12. **`TableRowSkeleton`** - Data table row
    - Shows multiple columns with equal spacing
    - Customizable column count
    - Good for admin tables

13. **`RoomCardSkeleton`** - Room information card
    - Shows image placeholder + room details
    - Used for room display pages

14. **`FormInputSkeleton`** - Form input field with label
    - Label placeholder + input field skeleton
    - Used in form-heavy pages

15. **`AdminDashboardSkeleton`** - Full admin dashboard
    - Combines HeaderSkeleton + StatsCardsSkeleton + TableRowSkeleton
    - Comprehensive loading state for admin panel

## Pages Updated With Skeletons

### User Pages
- ✅ **UserDashboard.jsx** - Shows `DashboardGridSkeleton` while loading user data
- ✅ **Complaints.jsx** - Shows `StatsCardsSkeleton` + `ComplaintCardSkeleton` grid
- ✅ **Gallery.jsx** - Shows `GalleryGridSkeleton` while fetching media
- ✅ **Profile.jsx** - Shows `ProfileSkeleton` while loading user profile
- ✅ **Login.jsx** - Imports `FormInputSkeleton` for room lookup loading states
- ✅ **Register.jsx** - Imports `FormInputSkeleton` for room lookup loading states

### Admin Pages
- ✅ **AdminComplaints.jsx** - Shows `ComplaintCardSkeleton` grid while loading complaints

### Components Not Yet Updated (Placeholder Pages)
- MyRoom.jsx - Placeholder page
- FoodMenu.jsx - No loading state needed (static data)
- Games.jsx - Placeholder page
- Feedback.jsx - Placeholder page
- ManageRooms.jsx - Placeholder page
- ForgotPassword.jsx - No loading skeleton (form-only)
- AdminDashboard.jsx - Static welcome cards (no loading needed)

## Animation

All skeletons use Tailwind's built-in **`animate-pulse`** class for smooth, subtle animation:
- Creates a gentle fading effect
- Repeats infinitely until content loads
- Dark mode compatible with proper color adjustment

## Styling Notes

- **Light Mode**: Skeletons use `bg-slate-200`
- **Dark Mode**: Skeletons use `bg-gray-700`
- **Rounded Corners**: Match actual content (lg, xl, 2xl, 3xl)
- **Spacing**: Consistent with page layouts

## Usage Examples

### Example 1: In a Page Component
```jsx
import { ComplaintCardSkeleton } from '../../components/SkeletonLoaders';

export const ComplaintsPage = () => {
  const [loading, setLoading] = useState(true);
  
  return (
    <div className="space-y-4">
      {loading ? (
        <>
          <ComplaintCardSkeleton />
          <ComplaintCardSkeleton />
          <ComplaintCardSkeleton />
        </>
      ) : (
        // Actual complaint cards
      )}
    </div>
  );
};
```

### Example 2: Conditional Profile Loading
```jsx
import { ProfileSkeleton } from '../../components/SkeletonLoaders';

export const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  
  if (!user) return <ProfileSkeleton />;
  
  return (
    // Actual profile content
  );
};
```

### Example 3: Grid Loading
```jsx
import { GalleryGridSkeleton } from '../../components/SkeletonLoaders';

{loading ? (
  <GalleryGridSkeleton count={6} />
) : (
  <div className="grid grid-cols-3">
    {/* Gallery images */}
  </div>
)}
```

## Benefits

1. **Better UX**: Shows placeholder content instead of spinners
2. **Perceived Performance**: Layout appears instantly, content fills in smoothly
3. **Consistency**: All pages use the same skeleton design language
4. **Responsive**: Adapts to mobile, tablet, and desktop layouts
5. **Dark Mode**: Full support for light and dark themes
6. **Reusable**: Pre-built combinations save development time

## Dark Mode Support

All skeletons automatically adjust colors in dark mode:
- Light mode backgrounds remain slate-200
- Dark mode backgrounds change to gray-700
- Text skeletons maintain contrast

Example dark mode CSS:
```css
.dark .skeleton {
  @apply bg-gray-700;
}
```

## Performance

- **No JavaScript**: Uses pure CSS animations
- **GPU Optimized**: Uses transform and opacity for smooth 60fps animations
- **Minimal Bundle**: Single component file with 300 lines of code
- **Tree-Shakeable**: Import only what you need

## Future Enhancements

Potential additions:
- Carousel/slider skeleton
- Map skeleton for location pages
- Chart/graph skeleton for statistics
- Multi-step form skeleton
- Search results skeleton
- Chat message skeleton variations
