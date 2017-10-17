#include <vector>

/*
* These functions sort a vector of integers, and return the vector of indexes of the first vector
*/
std::vector<int> BubbleSort(std::vector<int> &v);
MergeSort(std::vector<int> &v);

// 3 functions for MergeSort
void SplitAndMerge(std::vector<int> &w, int start, int end, std::vector<int> &v);
void Merge(std::vector<int> &w, int start, int middle, int end, std::vector<int> &v);
void Copy(std::vector<int> &v, std::vector<int> &w);