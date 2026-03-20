import { getPillars, getCategories, getLocations } from '@/lib/db/queries';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function ContentMatrixPage() {
  const [pillars, categories, locations] = await Promise.all([
    getPillars(),
    getCategories(),
    getLocations(),
  ]);

  // Group categories by pillar
  const categoriesByPillar: Record<string, typeof categories> = {};
  for (const cat of categories) {
    const pid = cat.pillar_id;
    if (!categoriesByPillar[pid]) categoriesByPillar[pid] = [];
    categoriesByPillar[pid].push(cat);
  }

  // Group locations by state
  const locationsByState: Record<string, typeof locations> = {};
  for (const loc of locations) {
    const state = loc.state || 'Unknown';
    if (!locationsByState[state]) locationsByState[state] = [];
    locationsByState[state].push(loc);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Content Matrix</h1>

      <Tabs defaultValue="pillars">
        <TabsList>
          <TabsTrigger value="pillars">
            Pillars ({pillars.length})
          </TabsTrigger>
          <TabsTrigger value="categories">
            Categories ({categories.length})
          </TabsTrigger>
          <TabsTrigger value="locations">
            Locations ({locations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pillars">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Categories</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pillars.map((pillar) => (
                    <TableRow key={pillar.id}>
                      <TableCell className="font-medium">{pillar.name}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {pillar.description || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {categoriesByPillar[pillar.id]?.length || 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant={pillar.is_active ? 'default' : 'secondary'}>
                          {pillar.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {pillars.map((pillar) => {
            const cats = categoriesByPillar[pillar.id] || [];
            if (cats.length === 0) return null;
            return (
              <Card key={pillar.id}>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">{pillar.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cats.map((cat) => (
                        <TableRow key={cat.id}>
                          <TableCell className="font-medium">{cat.name}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {cat.slug}
                          </TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                            {cat.description || '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={cat.is_active ? 'default' : 'secondary'}>
                              {cat.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          {Object.entries(locationsByState).map(([state, locs]) => (
            <Card key={state}>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{state}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>City</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locs.map((loc) => (
                      <TableRow key={loc.id}>
                        <TableCell className="font-medium">{loc.city}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {loc.display_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={loc.is_active ? 'default' : 'secondary'}>
                            {loc.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
