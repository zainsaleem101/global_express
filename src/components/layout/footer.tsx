export default function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container px-4 py-8 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>About Us</li>
              <li>Careers</li>
              <li>Press</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Services</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Parcel Delivery</li>
              <li>Air Freight</li>
              <li>Sea Freight</li>
              <li>Packaging</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Help Center</li>
              <li>FAQs</li>
              <li>Shipping Guide</li>
              <li>Track Order</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Cookie Policy</li>
              <li>Shipping Policy</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 GlobalExpress. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
