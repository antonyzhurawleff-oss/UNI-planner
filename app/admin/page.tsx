import { getSubmissions } from "@/lib/storage";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const submissions = getSubmissions() || [];

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Total submissions: {submissions.length}
          </p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 underline mt-4 inline-block"
          >
            ← Back to home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Countries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Universities
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No submissions yet
                    </td>
                  </tr>
                ) : (
                  submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {submission.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.input.admissionType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {submission.input.countries.join(", ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {submission.input.budget}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {submission.response.programs?.length || submission.response.universities?.length || 0} programs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(submission.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/results?id=${submission.id}`}
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed view toggle for each submission */}
        {submissions.length > 0 && (
          <div className="mt-8 space-y-6">
            {submissions.map((submission) => (
              <details
                key={submission.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <summary className="cursor-pointer font-semibold text-lg mb-4">
                  {submission.email} - {new Date(submission.createdAt).toLocaleString()}
                </summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Input:</h4>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                      {JSON.stringify(submission.input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">AI Response:</h4>
                    <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                      {JSON.stringify(submission.response, null, 2)}
                    </pre>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
