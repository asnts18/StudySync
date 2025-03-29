"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Textarea } from "../components/ui/textarea"

const CreateGroupPage = ({ onBack, onCreateGroup }) => {
  const [selectedTags, setSelectedTags] = useState([])
  const [location, setLocation] = useState("")
  const [groupSize, setGroupSize] = useState("3")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [selectedDays, setSelectedDays] = useState([]); // Stores selected days
  const [meetingTime, setMeetingTime] = useState(""); // Stores selected time
  const [repeating, setRepeating] = useState("none"); // Stores repeating frequency


  const tags = [
    "Practice Problems",
    "Quiet Study",
    "Exam Prep",
    "Homework",
    "Outdoor",
    "Library",
    "Daily Study",
    "Skill Building",
    "Design Sprint",
    "Cafe",
  ]

  const handleTagClick = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    onCreateGroup();
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-8 py-12">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-12">
          <button onClick={onBack} className="p-2 border-2 border-black hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-bold">create a study group</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 flex flex-col items-start">

                      {/* Name Section */}
          <div className="space-y-4">
            <label className="block text-lg text-left">Give your study group a name!</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="For fun study group"
              className="w-full p-4 border-2 border-black focus:outline-none"
            />
          </div>

          {/* Tags Section */}
          <div className="space-y-4">
            <label className="block text-lg text-left">What tags would you like to include?</label>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={`px-6 py-2 border-2 border-black rounded-full transition-colors ${
                    selectedTags.includes(tag) ? "bg-primary-yellow" : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

{/* Days and Times to Meet Section */}
<div className="space-y-4 w-full flex flex-col items-start">
  <label className="block text-lg text-left">Days and times to meet</label>
  
  {/* Days selection */}
  <div className="flex flex-wrap gap-3">
    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
      <button
        key={day}
        type="button"
        onClick={() => setSelectedDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])}
        className={`px-6 py-2 border-2 border-black rounded-full transition-colors ${
          selectedDays.includes(day) ? "bg-primary-yellow" : "bg-white hover:bg-gray-100"
        }`}
      >
        {day}
      </button>
    ))}
  </div>

  {/* Time selection */}
  <input
    type="time"
    value={meetingTime}
    onChange={(e) => setMeetingTime(e.target.value)}
    className="w-48 p-4 border-2 border-black focus:outline-none bg-white"
  />
</div>

{/* Repeating Section */}
<div className="space-y-4 w-full flex flex-col items-start">
  <label className="block text-lg text-left">Repeating?</label>
  <select
    value={repeating}
    onChange={(e) => setRepeating(e.target.value)}
    className="w-48 p-4 border-2 border-black focus:outline-none appearance-none bg-white"
  >
    <option value="none">Not repeating</option>
    <option value="weekly">Weekly</option>
    <option value="biweekly">Biweekly</option>
    <option value="monthly">Monthly</option>
  </select>
</div>

          {/* Location Section */}
          <div className="space-y-4">
            <label className="block text-lg text-left">Where will you be holding your study session?</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Tisch Library, Room 123D"
              className="w-full p-4 border-2 border-black focus:outline-none"
            />
          </div>

          {/* Group Size Section */}
          <div className="space-y-4 flex flex-col items-start">
            <label className="block text-lg text-left">How many people are you looking for total?</label>
            <select
              value={groupSize}
              onChange={(e) => setGroupSize(e.target.value)}
              className="w-48 p-4 border-2 border-black focus:outline-none appearance-none bg-white"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num} people
                </option>
              ))}
            </select>
          </div>

          {/* Additional Info Section */}
<div className="space-y-4 w-full">
  <label className="block text-lg text-left">Anything else to add?</label>
  <Textarea
    value={additionalInfo}
    onChange={(e) => setAdditionalInfo(e.target.value)}
    placeholder={`Feel free to introduce yourself briefly, share your preferred group learning methods, what you want to get from the group study, your hobbies, personalities, etc.

Tip:
The more you share, the easier to find the ideal group.`}
    className="min-h-[200px] p-4 border-2 border-black focus:outline-none resize-none w-full"
  />
</div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-12 py-4 bg-primary-yellow border-2 border-black hover:bg-dark-yellow transition-colors text-xl"
          >
            create group
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateGroupPage