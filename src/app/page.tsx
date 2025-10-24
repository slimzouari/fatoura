import { InvoiceList } from "@/components/InvoiceList";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Facturen
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Beheer je facturen en bereken automatisch omzet en uurloon compensaties
          </p>
        </div>
      </div>
      
      <InvoiceList />
    </div>
  );
}
