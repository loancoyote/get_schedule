// import Image from 'next/image';
import 'tailwindcss';
import LoadingSpinner from './components/loading';

export default function Home() {
  const isLoading = false;
  return (
    <div className="py-50">
      <div className="w-100 mx-auto mb-10">
        <button className="block w-50 p-2 mx-auto border-2 cursor-pointer">
          Get My Schedule
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <p className="text-center">これはテストです</p>
      )}
    </div>
  );
}
