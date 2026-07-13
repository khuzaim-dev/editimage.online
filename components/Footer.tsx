import Link from "next/link";
import Image from "next/image";
import { Code2, Share2 } from "lucide-react";

const toolLinks = [
  { label: "Resize Image", href: "/resize-image" },
  { label: "Compress Image", href: "/compress-image" },
  { label: "Crop Image", href: "/crop-image" },
  { label: "Convert Image", href: "/convert-image" },
  { label: "Remove Background", href: "/remove-background" },
  { label: "Watermark Image", href: "/watermark-image" },
  { label: "Bulk Resizer", href: "/bulk-resizer" },
  { label: "Image Editor", href: "/image-editor" },
];

const resourceLinks = [
  { label: "Blog", href: "/blog" },
  { label: "All Tools", href: "/tools" },
  { label: "Pricing", href: "/tools" },
  { label: "API (Coming Soon)", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
  { label: "GDPR", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 dark:bg-white/2">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/editimage-logo.svg"
                alt="editimage.online"
                width={150}
                height={34}
                className="object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Free, fast, and privacy-first image processing tools. No signup required.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Link href="https://github.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <Code2 size={18} />
              </Link>
              <Link href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
                <Share2 size={18} />
              </Link>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Tools</h3>
            <ul className="space-y-2.5">
              {toolLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {resourceLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} editimage.online. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for the open web.
          </p>
        </div>
      </div>
    </footer>
  );
}
