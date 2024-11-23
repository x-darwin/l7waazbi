'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, Shield, X, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BlockedCountry {
  id: string;
  country_code: string;
  country_name: string | null;
}

export function CountryBlockingConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<BlockedCountry[]>([]);
  const [newCountry, setNewCountry] = useState({ code: '', name: '' });
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<BlockedCountry | null>(null);

  useEffect(() => {
    fetchBlockedCountries();
  }, []);

  async function fetchBlockedCountries() {
    try {
      const response = await fetch('/api/blocked/countries');
      if (!response.ok) throw new Error('Failed to fetch blocked countries');
      const data = await response.json();
      setCountries(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load blocked countries',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function addCountry(e: React.FormEvent) {
    e.preventDefault();
    if (!newCountry.code || !newCountry.name) return;

    setAdding(true);
    try {
      const response = await fetch('/api/blocked/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_code: newCountry.code.toUpperCase(),
          country_name: newCountry.name,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add country');
      }

      toast({
        title: 'Success',
        description: `${newCountry.name} has been blocked successfully`,
      });

      setNewCountry({ code: '', name: '' });
      await fetchBlockedCountries();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add country',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  }

  async function removeCountry(country: BlockedCountry) {
    try {
      const response = await fetch('/api/blocked/countries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country_code: country.country_code }),
      });

      if (!response.ok) throw new Error('Failed to remove country');

      toast({
        title: 'Success',
        description: `${country.country_name} has been unblocked`,
      });

      await fetchBlockedCountries();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove country',
        variant: 'destructive',
      });
    }
  }

  const filteredCountries = countries.filter(country => 
    country.country_name?.toLowerCase().includes(search.toLowerCase()) ||
    country.country_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Add Country Form */}
      <Card className="hover-lift hover-glow md:sticky md:top-6 h-fit">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Add Country</CardTitle>
              <CardDescription>
                Block access from a specific country
              </CardDescription>
            </div>
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={addCountry} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country-code">Country Code</Label>
                <Input
                  id="country-code"
                  placeholder="US"
                  value={newCountry.code}
                  onChange={(e) => setNewCountry(prev => ({
                    ...prev,
                    code: e.target.value.toUpperCase().slice(0, 2)
                  }))}
                  maxLength={2}
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country-name">Country Name</Label>
                <Input
                  id="country-name"
                  placeholder="United States"
                  value={newCountry.name}
                  onChange={(e) => setNewCountry(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={adding || !newCountry.code || !newCountry.name}
            >
              {adding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Block Country
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Blocked Countries List */}
      <Card className="hover-lift hover-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Blocked Countries</CardTitle>
              <CardDescription>
                Currently blocked countries
              </CardDescription>
            </div>
            {countries.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Total: {countries.length}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search countries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country Code</TableHead>
                      <TableHead>Country Name</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCountries.map((country) => (
                      <TableRow key={country.id}>
                        <TableCell className="font-medium">{country.country_code}</TableCell>
                        <TableCell>{country.country_name}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedCountry(country)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirm Unblock</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to unblock {country.country_name}? This will allow access from this country.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-4 mt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedCountry(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    removeCountry(country);
                                    setSelectedCountry(null);
                                  }}
                                >
                                  Unblock Country
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCountries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          {search ? 'No countries match your search' : 'No countries blocked'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}