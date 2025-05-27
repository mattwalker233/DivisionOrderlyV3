import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">About Division Orderly</h1>

        <div className="prose prose-lg mx-auto mb-12">
          <p className="text-xl text-muted-foreground text-center">
            Division Orderly is an AI-powered platform designed to streamline the management of division orders for oil
            and gas properties.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                To simplify and automate the complex process of division order management, making it accessible and
                efficient for operators of all sizes.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technology</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Built with cutting-edge AI and machine learning technologies to provide accurate document processing and
                data extraction.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Designed to meet state-specific regulations and industry standards across multiple jurisdictions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Dedicated customer support team with deep industry knowledge to help you succeed.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
