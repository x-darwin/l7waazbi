export default function PaymentLoading() {
    return (
      <main className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto space-y-8 animate-pulse">
            <div className="h-12 bg-muted rounded-lg w-3/4 mx-auto" />
            <div className="h-6 bg-muted rounded w-1/2 mx-auto" />
            <div className="space-y-4">
              <div className="h-[200px] bg-muted rounded-lg" />
              <div className="h-[150px] bg-muted rounded-lg" />
              <div className="h-[100px] bg-muted rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    );
  }
  