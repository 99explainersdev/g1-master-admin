"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddQuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswerIndex: 0,
    explanation: "",
    category: "traffic_signs" as "traffic_signs" | "rules_of_road",
    imageUrl: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "correctAnswerIndex") {
      setFormData({ ...formData, [name]: parseInt(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Build options array
      const options = [
        formData.option1,
        formData.option2,
        formData.option3,
        formData.option4,
      ];

      const response = await fetch("/api/quiz/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: formData.question,
          options,
          correctAnswerIndex: formData.correctAnswerIndex,
          explanation: formData.explanation,
          category: formData.category,
          imageUrl: formData.imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add quiz");
      }

      alert("Quiz added successfully!");
      
      // Reset form
      setFormData({
        question: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctAnswerIndex: 0,
        explanation: "",
        category: "traffic_signs",
        imageUrl: "",
      });
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Add New Quiz Question</h1>
          <p className="text-gray-600 mt-2">
            Create a new quiz question for the G1 test preparation app
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="traffic_signs">Traffic Signs</option>
              <option value="rules_of_road">Rules of the Road</option>
            </select>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question *
            </label>
            <textarea
              name="question"
              required
              value={formData.question}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter the quiz question..."
            />
          </div>

          {/* Image URL (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL (Optional)
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://cloudinary.com/..."
            />
            {formData.imageUrl && (
              <div className="mt-3">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="max-w-xs rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Answer Options</h3>
            
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-start gap-3">
                <div className="flex items-center mt-2">
                  <input
                    type="radio"
                    name="correctAnswerIndex"
                    value={num - 1}
                    checked={formData.correctAnswerIndex === num - 1}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option {num} *
                    {formData.correctAnswerIndex === num - 1 && (
                      <span className="ml-2 text-green-600 text-xs font-semibold">
                        ✓ Correct Answer
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    name={`option${num}`}
                    required
                    value={formData[`option${num}` as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Enter option ${num}...`}
                  />
                </div>
              </div>
            ))}
            <p className="text-sm text-gray-500 italic">
              Select the radio button next to the correct answer
            </p>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation *
            </label>
            <textarea
              name="explanation"
              required
              value={formData.explanation}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Explain why this is the correct answer..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding Quiz..." : "Add Quiz Question"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-md font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Preview Card */}
        {formData.question && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{formData.question}</p>
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Question"
                    className="mt-3 max-w-sm rounded"
                  />
                )}
              </div>
              <div className="space-y-2">
                {[formData.option1, formData.option2, formData.option3, formData.option4].map(
                  (option, index) =>
                    option && (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-2 ${
                          formData.correctAnswerIndex === index
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <p className="text-gray-800">{option}</p>
                      </div>
                    )
                )}
              </div>
              {formData.explanation && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Explanation:
                  </p>
                  <p className="text-sm text-blue-800">{formData.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}