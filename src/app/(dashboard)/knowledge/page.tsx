import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { checkFreshness } from '@/lib/knowledge/freshness';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export default async function KnowledgeFreshnessPage() {
  const report = checkFreshness();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Knowledge Base Freshness</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalFiles}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fresh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold text-green-600">
              <CheckCircle className="size-5" />
              {report.freshFiles.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold text-amber-600">
              <AlertTriangle className="size-5" />
              {report.staleFiles.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {report.staleFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="size-4 text-amber-500" />
              Stale Files ({report.staleFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Last Reviewed</TableHead>
                  <TableHead>Days Since Review</TableHead>
                  <TableHead>Review Interval</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.staleFiles.map((file) => (
                  <TableRow key={file.relativePath}>
                    <TableCell className="font-medium">{file.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.lastReviewed
                        ? new Date(file.lastReviewed).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {file.daysSinceReview ?? '?'} days
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.reviewIntervalMonths} months
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {report.freshFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle className="size-4 text-green-500" />
              Fresh Files ({report.freshFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Last Reviewed</TableHead>
                  <TableHead>Days Since Review</TableHead>
                  <TableHead>Review Interval</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.freshFiles.map((file) => (
                  <TableRow key={file.relativePath}>
                    <TableCell className="font-medium">{file.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.lastReviewed
                        ? new Date(file.lastReviewed).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.daysSinceReview ?? '—'} days
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.reviewIntervalMonths} months
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
