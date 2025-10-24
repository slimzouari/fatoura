export default function KlantenPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Klanten
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Beheer je klantgegevens en factureringsregels
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Klantenbeheer
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Deze pagina wordt in een volgende fase ontwikkeld
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Klantgegevens worden momenteel beheerd via configuratiebestanden
          </p>
        </div>
      </div>
    </div>
  );
}