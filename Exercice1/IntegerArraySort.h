#include <vector>

// first step: void
// second step : modify the input vector and output the positions vector
void BubbleSort(std::vector<int> &v);
void MergeSort(std::vector<int> &v);

// 3 functions for MergeSort
void SplitAndMerge(std::vector<int> &w, int start, int end, std::vector<int> &v);
void Merge(std::vector<int> &w, int start, int middle, int end, std::vector<int> &v);
void Copy(std::vector<int> &v, std::vector<int> &w);