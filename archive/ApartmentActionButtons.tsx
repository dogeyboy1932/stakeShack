// import { Pencil, Trash2, Heart, UserPlus } from 'lucide-react';

// interface ApartmentActionButtonsProps {
//     onEdit?: () => void;
//     onRemove?: () => void;
//     onMarkInterest?: () => void;
//     onUnmarkInterest?: () => void;
//     onReferSomeone?: () => void;
//     isRemoving?: boolean;
//     isInterested?: boolean;
//     showInterestButton?: boolean;
//     showReferButton?: boolean;
//     showEditRemoveButtons?: boolean;
// }

// export function ApartmentActionButtons({
//     onEdit,
//     onRemove,
//     onMarkInterest,
//     onUnmarkInterest,
//     onReferSomeone,
//     isRemoving = false,
//     isInterested = false,
//     showInterestButton = false,
//     showReferButton = false,
//     showEditRemoveButtons = true,
// }: ApartmentActionButtonsProps) {
//     return (
//         <div className="flex gap-4 justify-center">
//             {showEditRemoveButtons && (
//                 <>
//                     {onEdit && (
//                         <button
//                             onClick={onEdit}
//                             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                         >
//                             <Pencil className="h-5 w-5" />
//                             Edit Apartment
//                         </button>
//                     )}

//                     {onRemove && (
//                         <button
//                             onClick={onRemove}
//                             disabled={isRemoving}
//                             className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
//                         >
//                             <Trash2 className="h-5 w-5" />
//                             {isRemoving ? 'Removing...' : 'Remove Listing'}
//                         </button>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// } 