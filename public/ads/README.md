# RaveTracker Ad Manager Instructions

## How to add your own Ad Banners:

1. **Place your image file** (PNG, JPG, WebP, GIF, or SVG) directly into this `public/ads/` folder.
   * Example: `public/ads/my_rave_banner.jpg`

2. **Open `public/ads/ads.json`** and add or edit an ad entry:

```json
[
  {
    "id": "my-banner-1",
    "title": "My Custom Event or Shop",
    "image": "ads/my_rave_banner.jpg",
    "targetUrl": "https://your-destination-link.com",
    "active": true,
    "position": "top"
  }
]
```

## Fields Explanation:
- `id`: Unique identifier for the ad.
- `title`: Alternative text / tooltip for the banner.
- `image`: Relative path to your image file inside `public/ads/` (e.g. `"ads/my_banner.png"`).
- `targetUrl`: The URL where the user will be redirected when clicking the ad banner.
- `active`: Set to `true` to enable or `false` to hide without deleting.
- `position`: `"top"`, `"sidebar"`, or `"banner"`.
