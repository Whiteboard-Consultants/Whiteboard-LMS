
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, BrainCircuit, Leaf, ShieldCheck, Cog, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

const futureFields = [
  {
    icon: <BrainCircuit className="h-8 w-8 text-purple-500" />,
    title: "AI & Machine Learning",
    description: "The fastest-growing field, transforming industries from tech to healthcare. A global degree provides access to cutting-edge research and innovation hubs.",
  },
  {
    icon: <Leaf className="h-8 w-8 text-green-500" />,
    title: "Sustainability & Green Tech",
    description: "As the world shifts to a green economy, demand for sustainability specialists, renewable energy engineers, and environmental policy experts is soaring.",
  },
  {
    icon: <AreaChart className="h-8 w-8 text-blue-500" />,
    title: "Business & Data Analytics",
    description: "Companies across all sectors rely on data to make strategic decisions. Roles for data analysts, scientists, and business intelligence experts are in high demand.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-red-500" />,
    title: "Cybersecurity",
    description: "In our digital world, protecting data is paramount. Cybersecurity analysts are crucial for safeguarding information for businesses and governments.",
  },
  {
    icon: <Cog className="h-8 w-8 text-orange-500" />,
    title: "Advanced Engineering",
    description: "Fields like robotics, mechatronics, and advanced manufacturing are at the forefront of the next industrial revolution, requiring highly skilled engineers.",
  },
  {
    icon: <Database className="h-8 w-8 text-yellow-500" />,
    title: "Big Data Management",
    description: "Managing and interpreting vast amounts of data is a highly valued skill across finance, e-commerce, and research.",
  },
];

const FutureProofCareerSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-background dark:bg-black">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
            Future-Proof Your Career with a Global Degree
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
            Align your education with the fastest-growing job markets. According to the World Economic Forum&apos;s Future of Jobs Report, roles in technology, data, and sustainability are set to dominate the next decade.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {futureFields.map((field) => (
            <Card key={field.title} className="shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-card text-card-foreground">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={cn("flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-lg bg-muted")}>
                    {field.icon}
                  </div>
                  <CardTitle className="font-headline text-xl">{field.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{field.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FutureProofCareerSection;
