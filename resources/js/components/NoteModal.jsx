import { useState } from "react";

const NoteModal = ({ isOpen, onClose, note, setNote }) => {
    const [tempNote, setTempNote] = useState(note);

    const handleSaveNote = () => {
        setNote(tempNote);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-md shadow-lg w-full max-w-md">
                <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
                    Add Note
                </h3>
                <textarea
                    value={tempNote}
                    onChange={(e) => setTempNote(e.target.value)}
                    className="w-full h-32 p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-surface-light dark:bg-surface-dark text-text dark:text-text-dark focus:ring-0 focus:border-primary dark:focus:border-primary-dark resize-none"
                    placeholder="Enter your note here..."
                    aria-label="Note"
                />
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveNote}
                        className="px-4 py-2 bg-primary dark:bg-primary-dark text-white rounded-md hover:bg-primary-dark dark:hover:bg-primary transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteModal;
